<template>
    <div class="container custom-list">
        <h3 style="margin-left:8px;">{{$t('customData.tradeList')}}</h3>
        <!-- <Button type="text" icon="funnel" style="float:right;" >筛选字段</Button> -->

        <Table v-loading="loading"
               :data="allList"
               :height="tableHeight"
               @row-click="clickRow"
               class="noborder-table"
               style="margin-top:18px;">
            <TableColumn v-for="item in columns"
                         :key="item.key"
                         :prop="item.key"
                         :label="item.title"
                         :align="item.align"
                         :width="item.width"
                         :min-width="item.width || 64"
                         :show-overflow-tooltip="true">
            </TableColumn>
        </Table>

        <div class="pagewrap">
            <Page :page-size="pagesize"
                  :page-sizes="pagesizeopts"
                  :total="total"
                  :current-page="curpage"
                  layout="total, prev, pager, next, sizes, jumper"
                  @current-change="changePage"
                  @size-change="sizeChange"></Page>
        </div>

        <Modal v-model="showDetail"
               :title="$t('customData.trade_detail')"
               :styles="{top: '50px'}"
               class="vertical-center-modal custom-list"
               width="1000px">
            <!-- @on-ok="ok"
            @on-cancel="cancel" -->
            <!-- <Spin size="large" fix v-if="spinShow"></Spin> -->
            <h3 class="detail-title">{{source_country}}{{$t('customData.trade_detail')}}</h3>
            <div class="detail-content">
                <div class="detail-group clearfix">
                    <div class="group-title">{{$t('customData.company_info')}}</div>
                    <div class="group-content">
                        <div v-for="(item,index) in companyFields" :key="index" v-if="tradeList[item.value]"
                             class="group-item clearfix">
                            <span class="item-title">{{ item.label+'：' }}</span>
                            <span class="item-content"> {{ tradeList[item.value] }} </span>
                        </div>
                        <!-- <div class="group-item clearfix">
                          <span class="item-title">联系人 :</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">采购商 :</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">原产国 :</span>
                          <span class="item-content">China</span>
                        </div> -->
                    </div>
                </div>
                <div class="detail-group clearfix">
                    <div class="group-title">{{$t('customData.company_info')}}</div>
                    <div class="group-content">
                        <div v-for="(item,index) in productFields" :key="index" v-if="tradeList[item.value]"
                             class="group-item clearfix">
                            <span class="item-title">{{ item.label+'：' }}</span>
                            <span class="item-content"> {{ tradeList[item.value] }} </span>
                        </div>
                        <!-- <div class="group-item clearfix">
                          <span class="item-title">联系人:</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">采购商:</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">原产国:</span>
                          <span class="item-content">China</span>
                        </div> -->
                    </div>
                </div>
                <div class="detail-group clearfix">
                    <div class="group-title">{{$t('customData.trade_info')}}</div>
                    <div class="group-content">
                        <div v-for="(item,index) in tradeFields" :key="index" v-if="tradeList[item.value]"
                             class="group-item clearfix">
                            <span class="item-title">{{ item.label+'：' }}</span>
                            <span class="item-content"> {{ tradeList[item.value] }} </span>
                        </div>
                        <!-- <div class="group-item clearfix">
                          <span class="item-title">供货商地址2:</span>
                          <span class="item-content">这是一个巨长的句子balabala balabala balabala balabala balabala这是一个巨长的句子balabala balabala balabala balabala balabala</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">采购商:</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">原产国:</span>
                          <span class="item-content">China</span>
                        </div> -->
                    </div>
                </div>
                <div class="detail-group clearfix">
                    <div class="group-title">{{$t('customData.freight_info')}}</div>
                    <div class="group-content">
                        <div v-for="(item,index) in freightFields" :key="index" v-if="tradeList[item.value]"
                             class="group-item clearfix">
                            <span class="item-title">{{ item.label+'：' }}</span>
                            <span class="item-content"> {{ tradeList[item.value] }} </span>
                        </div>
                        <!-- <div class="group-item clearfix">
                          <span class="item-title">供货商地址2:</span>
                          <span class="item-content">这是一个巨长的句子balabala balabala balabala balabala balabala这是一个巨长的句子balabala balabala balabala balabala balabala</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">采购商:</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">原产国:</span>
                          <span class="item-content">China</span>
                        </div> -->
                    </div>
                </div>
                <div class="detail-group clearfix">
                    <div class="group-title">{{$t('customData.pack_info')}}</div>
                    <div class="group-content">
                        <div v-for="(item,index) in pakingFields" :key="index" v-if="tradeList[item.value]"
                             class="group-item clearfix">
                            <span class="item-title">{{ item.label+'：' }}</span>
                            <span class="item-content"> {{ tradeList[item.value] }} </span>
                        </div>
                        <!-- <div class="group-item clearfix">
                          <span class="item-title">供货商地址2:</span>
                          <span class="item-content">这是一个巨长的句子balabala balabala balabala balabala balabala这是一个巨长的句子balabala balabala balabala balabala balabala</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">采购商:</span>
                          <span class="item-content">Sam Smith</span>
                        </div>
                        <div class="group-item clearfix">
                          <span class="item-title">原产国:</span>
                          <span class="item-content">China</span>
                        </div> -->
                    </div>
                </div>
            </div>
        </Modal>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        props: {
            allList: Array,
            loading: Boolean,
            pagesizeopts: Array,
            curpage: Number,
            total: Number,
            pagesize: Number
        },
        data() {
            return {
                spinShow: false,
                columns: [ /* 表头数据 */
                    { title: this.$t('index'), width: 60, type: 'index', align: 'center' },
                    { title: this.$t('customData.arrive_date'), key: 'Declaration_Date', width: 120, align: 'center' },
                    { title: 'HS Code', key: 'Harmonized_Code', width: 120, align: 'center' },
                    { title: this.$t('customData.impoter'), key: 'Importer', width: 100, align: 'center' },
                    { title: this.$t('customData.exporter'), key: 'provider', width: 100, align: 'center' },
                    { title: this.$t('customData.prod_desc'), key: 'Description', width: 150, align: 'center' },
                    { title: this.$t('customData.money'), key: 'CIF_FOB', width: 160, align: 'center' },
                    { title: this.$t('customData.weight'), key: 'Quantity', width: 120, align: 'center' },
                    { title: this.$t('customData.origin'), key: 'Origin_Country', width: 100, align: 'center' }
                ],
                tradeList: [], /* 交易明细 */
                showDetail: false,
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
                ],
                tradeFields: [ /* 交易信息 */
                    {
                        label: this.$t('customData.CIF_US'),
                        value: 'CIF_US'
                    },
                    {
                        label: this.$t('customData.Unit_Value_CIF_US'),
                        value: 'Unit_Value_CIF_US'
                    },
                    {
                        label: this.$t('customData.FOB_US'),
                        value: 'FOB_US'
                    },
                    {
                        label: this.$t('customData.Unit_Value_FOB_US'),
                        value: 'Unit_Value_FOB_US'
                    },
                    {
                        label: this.$t('customData.Price_dollar'),
                        value: 'Price_dollar'
                    },
                    {
                        label: this.$t('customData.Price_ruble'),
                        value: 'Price_ruble'
                    },
                    {
                        label: this.$t('customData.Price'),
                        value: 'Price'
                    },
                    {
                        label: this.$t('customData.Statistic_Unit_Value_US'),
                        value: 'Statistic_Unit_Value_US'
                    },
                    {
                        label: this.$t('customData.Cost_of_goods'),
                        value: 'Cost_of_goods'
                    },
                    {
                        label: this.$t('customData.Quantity'),
                        value: 'Quantity'
                    },
                    {
                        label: this.$t('customData.manifest_nbr'),
                        value: 'manifest_nbr'
                    },
                    {
                        label: this.$t('customData.UNIT_OF_QUANTITY'),
                        value: 'UNIT_OF_QUANTITY'
                    },
                    {
                        label: this.$t('customData.Gross_Weight_Clearance_Total'),
                        value: 'Gross_Weight_Clearance_Total'
                    },
                    {
                        label: this.$t('customData.net_weight'),
                        value: 'net_weight'
                    },
                    {
                        label: this.$t('customData.Weight'),
                        value: 'Weight'
                    },
                    {
                        label: this.$t('customData.weight_unit'),
                        value: 'weight_unit'
                    },
                    {
                        label: this.$t('customData.Payment'),
                        value: 'Payment Way'
                    }
                ],
                freightFields: [ /* 货运信息字段 */
                    {
                        label: this.$t('customData.Freight_US'),
                        value: 'Freight_US'
                    },
                    {
                        label: this.$t('customData.Insurance_US'),
                        value: 'Insurance_US'
                    },
                    {
                        label: this.$t('customData.Deposit'),
                        value: 'Deposit'
                    },
                    {
                        label: this.$t('customData.Insurance_Currency'),
                        value: 'Insurance_Currency'
                    },
                    {
                        label: this.$t('customData.BYDATE'),
                        value: 'BYDATE'
                    },
                    {
                        label: this.$t('customData.est_arrival_date'),
                        value: 'est_arrival_date'
                    },
                    {
                        label: this.$t('customData.Declaration_Date'),
                        value: 'Declaration_Date'
                    },
                    {
                        label: this.$t('customData.DataType'),
                        value: 'DataType'
                    },
                    {
                        label: this.$t('customData.REG_DATE'),
                        value: 'REG_DATE'
                    },
                    {
                        label: this.$t('customData.year'),
                        value: 'year'
                    },
                    {
                        label: this.$t('customData.month'),
                        value: 'month'
                    },
                    {
                        label: this.$t('customData.DAY'),
                        value: 'DAY'
                    },
                    {
                        label: this.$t('customData.bill_of_lading_nbr'),
                        value: 'bill_of_lading_nbr'
                    },
                    {
                        label: this.$t('customData.foreign_port_lading'),
                        value: 'foreign_port_lading'
                    },
                    {
                        label: this.$t('customData.Shipping_Port'),
                        value: 'Shipping_Port'
                    },
                    {
                        label: this.$t('customData.SHIPPING_DATE'),
                        value: 'SHIPPING_DATE'
                    },
                    {
                        label: this.$t('customData.Shipment_Load_Type'),
                        value: 'Shipment_Load_Type'
                    },
                    {
                        label: this.$t('customData.Delivery_Port'),
                        value: 'Delivery_Port'
                    },
                    {
                        label: this.$t('customData.carrier_code'),
                        value: 'carrier_code'
                    },
                    {
                        label: this.$t('customData.Carrier'),
                        value: 'Carrier'
                    },
                    {
                        label: this.$t('customData.Transport_Company'),
                        value: 'Transport_Company'
                    },
                    {
                        label: this.$t('customData.Transport_Way'),
                        value: 'Transport_Way'
                    },
                    {
                        label: this.$t('customData.Channel'),
                        value: 'Channel'
                    },
                    {
                        label: this.$t('customData.vessel_country_code'),
                        value: 'vessel_country_code'
                    },
                    {
                        label: this.$t('customData.Vessel_Flag'),
                        value: 'Vessel_Flag'
                    },
                    {
                        label: this.$t('customData.voyage_number'),
                        value: 'voyage_number'
                    },
                    {
                        label: this.$t('customData.vessel_code'),
                        value: 'vessel_code'
                    },
                    {
                        label: this.$t('customData.Vessel_Name'),
                        value: 'Vessel_Name'
                    },
                    {
                        label: this.$t('customData.CUSTOMS_AGENT'),
                        value: 'CUSTOMS_AGENT'
                    },
                    {
                        label: this.$t('customData.Customs_City'),
                        value: 'Customs_City'
                    },
                    {
                        label: this.$t('customData.Means_of_Transport'),
                        value: 'Means_of_Transport'
                    }
                ],
                pakingFields: [ /* 包装信息 */
                    {
                        label: this.$t('customData.Package_Type'),
                        value: 'Package_Type'
                    },
                    {
                        label: this.$t('customData.Quantity_of_Packages'),
                        value: 'Quantity_of_Packages'
                    }
                ],
                otherFields: [ /* 其他信息 */
                    {
                        label: this.$t('customData.Clearance_Code'),
                        value: 'Clearance_Code'
                    },
                    {
                        label: this.$t('customData.Declaration_number'),
                        value: 'Declaration_number'
                    },
                    {
                        label: this.$t('customData.Currency_code'),
                        value: 'Currency_code'
                    },
                    {
                        label: this.$t('customData.Exchange_rate'),
                        value: 'Exchange_rate'
                    },
                    {
                        label: this.$t('customData.Unit_Type'),
                        value: 'Unit_Type'
                    },
                    {
                        label: this.$t('customData.Tax'),
                        value: 'Tax'
                    },
                    {
                        label: this.$t('customData.Internal_Taxes'),
                        value: 'Internal_Taxes'
                    },
                    {
                        label: this.$t('customData.Tax_to_the_Gain'),
                        value: 'Tax_to_the_Gain'
                    },
                    {
                        label: this.$t('customData.Rate_of_Statistic'),
                        value: 'Rate_of_Statistic'
                    },
                    {
                        label: this.$t('customData.Total_Tax_Incl'),
                        value: 'Total_Tax_Incl'
                    },
                    {
                        label: this.$t('customData.Free_Zone'),
                        value: 'Free_Zone'
                    },
                    {
                        label: this.$t('customData.Variety'),
                        value: 'Variety'
                    },
                    {
                        label: this.$t('customData.RUT'),
                        value: 'RUT'
                    },
                    {
                        label: this.$t('customData.Transport_Document'),
                        value: 'Transport_Document'
                    },
                    {
                        label: this.$t('customData.Transport_Document_Date'),
                        value: 'Transport_Document_Date'
                    },
                    {
                        label: this.$t('customData.Incoterm'),
                        value: 'Incoterm'
                    },
                    {
                        label: this.$t('customData.country'),
                        value: 'country'
                    },
                    {
                        label: this.$t('customData.dp_of_unlading'),
                        value: 'dp_of_unlading'
                    },
                    {
                        label: this.$t('customData.measurement'),
                        value: 'measurement'
                    },
                    {
                        label: this.$t('customData.measurement_unit'),
                        value: 'measurement_unit'
                    },
                    {
                        label: this.$t('customData.delete_indicator'),
                        value: 'delete_indicator'
                    },
                    {
                        label: this.$t('customData.place_receipt'),
                        value: 'place_receipt'
                    },
                    {
                        label: this.$t('customData.inbound_entry_type'),
                        value: 'inbound_entry_type'
                    },
                    {
                        label: this.$t('customData.frob_indicator'),
                        value: 'frob_indicator'
                    },
                    {
                        label: this.$t('customData.master_house_bill_indicator'),
                        value: 'master_house_bill_indicator'
                    },
                    {
                        label: this.$t('customData.MASTER_BILL_OF_LADING'),
                        value: 'MASTER_BILL_OF_LADING'
                    },
                    {
                        label: this.$t('customData.container_number'),
                        value: 'container_number'
                    },
                    {
                        label: this.$t('customData.piece_count'),
                        value: 'piece_count'
                    },
                    {
                        label: this.$t('customData.SEAL_1'),
                        value: 'SEAL_1'
                    },
                    {
                        label: this.$t('customData.eq_desc_code'),
                        value: 'eq_desc_code'
                    },
                    {
                        label: this.$t('customData.CONT_TYPE'),
                        value: 'CONT_TYPE'
                    },
                    {
                        label: this.$t('customData.LOAD_STATUS'),
                        value: 'LOAD_STATUS'
                    },
                    {
                        label: this.$t('customData.TYPE_SERVICE'),
                        value: 'TYPE_SERVICE'
                    },
                    {
                        label: this.$t('customData.MRKS_NBRS'),
                        value: 'MRKS_NBRS'
                    },
                    {
                        label: this.$t('customData.TEU'),
                        value: 'TEU'
                    },
                    {
                        label: this.$t('customData.ConIsShipping'),
                        value: 'ConIsShipping'
                    },
                    {
                        label: this.$t('customData.us_dist_port'),
                        value: 'us_dist_port'
                    },
                    {
                        label: this.$t('customData.foreign_port'),
                        value: 'foreign_port'
                    },
                    {
                        label: this.$t('customData.Payer_name'),
                        value: 'Payer_name'
                    },
                    {
                        label: this.$t('customData.Payer_address'),
                        value: 'Payer_address'
                    },
                    {
                        label: this.$t('customData.Terms_of_Delivery'),
                        value: 'Terms_of_Delivery'
                    },
                    {
                        label: this.$t('customData.Place_of_delivery'),
                        value: 'Place_of_delivery'
                    },
                    {
                        label: this.$t('customData.STAT'),
                        value: 'STAT'
                    },
                    {
                        label: this.$t('customData.ND'),
                        value: 'ND'
                    },
                    {
                        label: this.$t('customData.Trade_category'),
                        value: 'Trade_category'
                    },
                    {
                        label: this.$t('customData.Buyer_tax_code'),
                        value: 'Buyer_tax_code'
                    },
                    {
                        label: this.$t('customData.Type_of_Document'),
                        value: 'Type_of_Document'
                    },
                    {
                        label: this.$t('customData.Document_Number'),
                        value: 'Document_Number'
                    },
                    {
                        label: this.$t('customData.Statement_Number'),
                        value: 'Statement_Number'
                    },
                    {
                        label: this.$t('customData.Customs'),
                        value: 'Customs'
                    },
                    {
                        label: this.$t('customData.Right_Import'),
                        value: 'Right_Import'
                    },
                    {
                        label: this.$t('customData.VAT'),
                        value: 'VAT'
                    },
                    {
                        label: this.$t('customData.Additional_VAT_Inscript'),
                        value: 'Additional_VAT_Inscript'
                    },
                    {
                        label: this.$t('customData.Additional_VAT_Not_Inscript'),
                        value: 'Additional_VAT_Not_Inscript'
                    },
                    {
                        label: this.$t('customData.Sale_Condition'),
                        value: 'Sale_Condition'
                    },
                    {
                        label: this.$t('customData.REMARKS'),
                        value: 'REMARKS'
                    }

                ],
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
                ]
            };
        },
        computed: {
            ...mapState({
                window_height: 'window_height'
            }),
            // companyFields(){
            //   return this.$store.state.customs.companyFields
            // },
            // productFields(){
            //   return this.$store.state.customs.productFields
            // },
            // tradeFields(){
            //   return this.$store.state.customs.tradeFields
            // },
            // freightFields(){
            //   return this.$store.state.customs.freightFields
            // },
            // pakingFields(){
            //   return this.$store.state.customs.pakingFields
            // },
            // otherFields(){
            //   return this.$store.state.customs.otherFields
            // },
            // sourceList(){
            //     return this.$store.state.customs.sourceList
            // },
            source_country() {
                let country = '';
                this.sourceList.forEach(item => {
                    if (this.tradeList.country == item.value) {
                        country = item.label;
                    }
                });
                return country;
            },
            tableHeight() {
                return this.window_height - 310;
            }
        },
        created() {
            this.stringTrim();
        },
        methods: {
            stringTrim() {
                String.prototype.trim = function() {
                    return this.replace(/(^\s*)|(\s*$)/g, '');
                };
            },
            clickRow(currentRow) {
                const explorer = window.navigator.userAgent;
                let selecter = '';
                // 判断浏览器
                if (explorer.indexOf('MSIE') >= 0 || explorer.indexOf('Opera') >= 0) {
                    const selected = document.selection.createRange();
                    selecter = selected.text;
                } else {
                    selecter = window.getSelection();
                }

                // 返回一个  Selection 对象，表示用户选择的文本范围或光标的当前位置。
                /*
                    None: 当前没有选择。
                    Caret: 选区已折叠（即 光标在字符之间，并未处于选中状态）。
                    Range: 选择的是一个范围。
                */
                // console.log(selecter)
                if (selecter.type != 'Range') {
                    this.getDetail(currentRow.rowKey);
                    // this.$router.push({
                    //     name: 'customs-detail',
                    //     query: this.tradeList
                    // });
                    this.showDetail = true;
                }
            },
            getDetail(rowKey) {
                this.spinShow = true;
                util.ajax({
                    url: '/hbase-solr/solr/searchGet',
                    method: 'post',
                    data: {
                        tableName: 'CustomsDataNew',
                        rowKey
                    }
                }).then(res => {
                    this.spinShow = false;
                    if (res.data.code == 1) {
                        this.tradeList = res.data.data;
                        if (this.tradeList.country != undefined) {
                            this.tradeList.country = this.tradeList.country.trim();
                        }
                    } else {
                        this.tradeList = [];
                    }
                });
            },
            changePage(value) {
                this.$emit('changePage', value);
            },
            sizeChange(value) {
                this.$emit('sizeChange', value);
            }
        }

    };
</script>

<style scoped>
    .container h3 {
        display: inline-block;
        font-weight: normal;
        color: #2d2f2e;
        font-size: 16px;
    }

    .detail-title {
        text-align: center;
        font-size: 16px;
        width: 100%;
    }

    .detail-content {
        border: 1px solid #ececec;
        margin-top: 30px;
        border-radius: 5px;
    }

    .group-title {
        height: 36px;
        line-height: 36px;
        font-size: 14px;
        font-weight: bold;
        background-color: #f7f7f7;
        padding-left: 28px;
    }

    .group-item {
        /* float: left; */
        width: 100%;
        height: 32px;
        line-height: 32px;
        padding-left: 30px;
    }

    .item-title {
        float: left;
        display: inline-block;
        width: 130px;
    }

    .item-content {
        display: inline-block;
        float: left;
        width: calc(100% - 130px);
    }

    .clearfix:after {
        content: "";
        display: block;
        clear: both;
    }
</style>

<style lang="less">
    .custom-list {
        .ivu-table-header, .ivu-table-body {
            table {
                width: 100% !important;
            }
        }

        .ivu-modal-body {
            min-height: 450px;
            max-height: 550px;
            /* height: 450px; */
            overflow: auto;
            position: relative;
        }

        .ivu-table-row {
            cursor: pointer !important;
        }

        &.vertical-center-modal {
            display: flex;
            align-items: center;
            justify-content: center;

            .ivu-modal {
                top: 200;
            }
        }
    }

    .pagewrap {
        margin-top: 10px;
        position: relative;
        text-align: right;
    }
</style>
