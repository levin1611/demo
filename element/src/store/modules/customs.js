export default {
    state: {
        companyFields: [ /* 公司信息 */
            {
                label: '采购商编码',
                value: 'Importer_Code'
            },
            {
                label: '采购商城市',
                value: 'Importer_Department'
            },
            {
                label: '采购商',
                value: 'Importer'
            },
            {
                label: '采购商类型',
                value: 'TYPE_OF_IMPORT'
            },
            {
                label: '供应商',
                value: 'provider'
            },
            {
                label: '通知人',
                value: 'NOTIFYNAME'
            },
            {
                label: '原产国',
                value: 'Origin_Country'
            },
            {
                label: '生产国',
                value: 'Product_Country'
            },
            {
                label: '供应商地址1',
                value: 'SHIPPER_ADDR_1'
            },
            {
                label: '供应商地址2',
                value: 'SHIPPER_ADDR_2'
            },
            {
                label: '供应商地址3',
                value: 'SHIPPER_ADDR_3'
            },
            {
                label: '供应商地址4',
                value: 'SHIPPER_ADDR_4'
            },
            {
                label: '供应商出口邮件',
                value: 'Provider_Exporter_Mail'
            },
            {
                label: '采购商地址1',
                value: 'CONSIGNEE_ADDR_1'
            },
            {
                label: '采购商地址2',
                value: 'CONSIGNEE_ADDR_2'
            },
            {
                label: '采购商地址3',
                value: 'CONSIGNEE_ADDR_3'
            },
            {
                label: '采购商地址4',
                value: 'CONSIGNEE_ADDR_4'
            },
            {
                label: '通知人地址1',
                value: 'NOTIFY_ADDR_1'
            },
            {
                label: '通知人地址2',
                value: 'NOTIFY_ADDR_2'
            },
            {
                label: '通知人地址3',
                value: 'NOTIFY_ADDR_3'
            },
            {
                label: '通知人地址4',
                value: 'NOTIFY_ADDR_4'
            },
            {
                label: '担保人编码',
                value: 'Code_of_the_guarantor'
            },
            {
                label: '担保人',
                value: 'The_guarantor'
            },
            {
                label: '担保人地址',
                value: 'The_address_of_the_guarantor'
            },
            {
                label: '采购商国家',
                value: 'Purchase_Country'
            },
            {
                label: '供应商国家',
                value: 'Provider_Country'
            },
            {
                label: '电话',
                value: 'TEL'
            },
            {
                label: '传真',
                value: 'FAX'
            },
            {
                label: '邮箱2',
                value: 'EMAIL2'
            },
            {
                label: '邮箱',
                value: 'email'
            },
            {
                label: '联系方式',
                value: 'contact'
            },
            {
                label: '地址',
                value: 'addr'
            },
            {
                label: 'Con_string',
                value: 'Con_string'
            },
            {
                label: '网站',
                value: 'WEB'
            }
        ],
        productFields: [ /* 产品信息 */
            {
                label: '产品状态',
                value: 'PRODUCT_STATUS'
            },
            {
                label: 'HS 编码',
                value: 'Harmonized_Code'
            },
            {
                label: 'HS 编码描述',
                value: 'HS_CODE_DESC'
            },
            {
                label: '商品编号',
                value: 'List_item_number'
            },
            {
                label: '品牌',
                value: 'Brand'
            },
            {
                label: '产品描述',
                value: 'Description'
            },
            {
                label: '制造商',
                value: 'manufacturer'
            }
        ],
        tradeFields: [ /* 交易信息 */
            {
                label: 'CIF价',
                value: 'CIF_US'
            },
            {
                label: 'CIF单价',
                value: 'Unit_Value_CIF_US'
            },
            {
                label: 'FOB价',
                value: 'FOB_US'
            },
            {
                label: 'FOB单价',
                value: 'Unit_Value_FOB_US'
            },
            {
                label: '价格(US)',
                value: 'Price_dollar'
            },
            {
                label: '价格(lB)',
                value: 'Price_ruble'
            },
            {
                label: '价格',
                value: 'Price'
            },
            {
                label: '单价（美元）',
                value: 'Statistic_Unit_Value_US'
            },
            {
                label: '货物成本',
                value: 'Cost_of_goods'
            },
            {
                label: '数量',
                value: 'Quantity'
            },
            {
                label: '数量nbr',
                value: 'manifest_nbr'
            },
            {
                label: '数量单位',
                value: 'UNIT_OF_QUANTITY'
            },
            {
                label: '毛重',
                value: 'Gross_Weight_Clearance_Total'
            },
            {
                label: '净重',
                value: 'net_weight'
            },
            {
                label: '重量',
                value: 'Weight'
            },
            {
                label: '重量单位',
                value: 'weight_unit'
            },
            {
                label: '付款方式',
                value: 'Payment Way'
            }
        ],
        freightFields: [ /* 货运信息字段 */
            {
                label: '运费',
                value: 'Freight_US'
            },
            {
                label: '保险',
                value: 'Insurance_US'
            },
            {
                label: '保证金',
                value: 'Deposit'
            },
            {
                label: '保费货币',
                value: 'Insurance_Currency'
            },
            {
                label: '日期',
                value: 'BYDATE'
            },
            {
                label: '预计到港日期',
                value: 'est_arrival_date'
            },
            {
                label: '（到港）日期',
                value: 'Declaration_Date'
            },
            {
                label: '日期类型',
                value: 'DataType'
            },
            {
                label: '注册日期',
                value: 'REG_DATE'
            },
            {
                label: '年',
                value: 'year'
            },
            {
                label: '月',
                value: 'month'
            },
            {
                label: '日',
                value: 'DAY'
            },
            {
                label: '提单号码',
                value: 'bill_of_lading_nbr'
            },
            {
                label: '外国提单',
                value: 'foreign_port_lading'
            },
            {
                label: '启运港',
                value: 'Shipping_Port'
            },
            {
                label: '启运日期',
                value: 'SHIPPING_DATE'
            },
            {
                label: '装运负荷类型',
                value: 'Shipment_Load_Type'
            },
            {
                label: '抵达港',
                value: 'Delivery_Port'
            },
            {
                label: '承运编码',
                value: 'carrier_code'
            },
            {
                label: '承运人',
                value: 'Carrier'
            },
            {
                label: '运输公司',
                value: 'Transport_Company'
            },
            {
                label: '运输方式',
                value: 'Transport_Way'
            },
            {
                label: '航道',
                value: 'Channel'
            },
            {
                label: '船运国家编码',
                value: 'vessel_country_code'
            },
            {
                label: '船运标志',
                value: 'Vessel_Flag'
            },
            {
                label: '航程号码',
                value: 'voyage_number'
            },
            {
                label: '船运编码',
                value: 'vessel_code'
            },
            {
                label: '船名',
                value: 'Vessel_Name'
            },
            {
                label: '海关代理人',
                value: 'CUSTOMS_AGENT'
            },
            {
                label: '海关城市',
                value: 'Customs_City'
            },
            {
                label: '运输工具',
                value: 'Means_of_Transport'
            }
        ],
        pakingFields: [ /* 包装信息 */
            {
                label: '包裹类型',
                value: 'Package_Type'
            },
            {
                label: '包裹数量',
                value: 'Quantity_of_Packages'
            }
        ],
        otherFields: [ /* 其他信息 */
            {
                label: '清关代码',
                value: 'Clearance_Code'
            },
            {
                label: '申报编码',
                value: 'Declaration_number'
            },
            {
                label: '货币编号',
                value: 'Currency_code'
            },
            {
                label: '汇率',
                value: 'Exchange_rate'
            },
            {
                label: '单位类型',
                value: 'Unit_Type'
            },
            {
                label: '税务',
                value: 'Tax'
            },
            {
                label: '国内税额',
                value: 'Internal_Taxes'
            },
            {
                label: '税后利润',
                value: 'Tax_to_the_Gain'
            },
            {
                label: '统计率',
                value: 'Rate_of_Statistic'
            },
            {
                label: '总税',
                value: 'Total_Tax_Incl'
            },
            {
                label: '自由区',
                value: 'Free_Zone'
            },
            {
                label: '品种',
                value: 'Variety'
            },
            {
                label: '税号',
                value: 'RUT'
            },
            {
                label: '外贸单证',
                value: 'Transport_Document'
            },
            {
                label: '外贸单证日期',
                value: 'Transport_Document_Date'
            },
            {
                label: '通则',
                value: 'Incoterm'
            },
            {
                label: '国家',
                value: 'country'
            },
            {
                label: '脱口dp',
                value: 'dp_of_unlading'
            },
            {
                label: '测量',
                value: 'measurement'
            },
            {
                label: '测量单位',
                value: 'measurement_unit'
            },
            {
                label: '删除指标',
                value: 'delete_indicator'
            },
            {
                label: '收据',
                value: 'place_receipt'
            },
            {
                label: '入站条目类型',
                value: 'inbound_entry_type'
            },
            {
                label: 'frob指标',
                value: 'frob_indicator'
            },
            {
                label: '主账单指标',
                value: 'master_house_bill_indicator'
            },
            {
                label: '主提单',
                value: 'MASTER_BILL_OF_LADING'
            },
            {
                label: '柜号',
                value: 'container_number'
            },
            {
                label: '件数',
                value: 'piece_count'
            },
            {
                label: '封条',
                value: 'SEAL_1'
            },
            {
                label: 'eq_desc_code',
                value: 'eq_desc_code'
            },
            {
                label: '柜子类型',
                value: 'CONT_TYPE'
            },
            {
                label: '装载状态',
                value: 'LOAD_STATUS'
            },
            {
                label: '服务类型',
                value: 'TYPE_SERVICE'
            },
            {
                label: '标记',
                value: 'MRKS_NBRS'
            },
            {
                label: '标准箱',
                value: 'TEU'
            },
            {
                label: 'ConIsShipping',
                value: 'ConIsShipping'
            },
            {
                label: 'us_dist_port',
                value: 'us_dist_port'
            },
            {
                label: 'foreign_port',
                value: 'foreign_port'
            },
            {
                label: '付款人名称',
                value: 'Payer_name'
            },
            {
                label: '付款人地址',
                value: 'Payer_address'
            },
            {
                label: '交货条款',
                value: 'Terms_of_Delivery'
            },
            {
                label: '交货地',
                value: 'Place_of_delivery'
            },
            {
                label: 'STAT',
                value: 'STAT'
            },
            {
                label: 'ND',
                value: 'ND'
            },
            {
                label: '贸易类别',
                value: 'Trade_category'
            },
            {
                label: '采购商纳税代码',
                value: 'Buyer_tax_code'
            },
            {
                label: '文件类型',
                value: 'Type_of_Document'
            },
            {
                label: '文件编号',
                value: 'Document_Number'
            },
            {
                label: '状态号码',
                value: 'Statement_Number'
            },
            {
                label: '海关',
                value: 'Customs'
            },
            {
                label: '直接进口',
                value: 'Right_Import'
            },
            {
                label: '增值税',
                value: 'VAT'
            },
            {
                label: '木质的包装',
                value: 'Additional_VAT_Inscript'
            },
            {
                label: '非木质的包装',
                value: 'Additional_VAT_Not_Inscript'
            },
            {
                label: '销售条件',
                value: 'Sale_Condition'
            },
            {
                label: '备注',
                value: 'REMARKS'
            }

        ],
        sourceList: [ /* 数据源  国家 */
            {
                value: 'all',
                label: '全部'
            },
            {
                value: 'USA',
                label: '美国'
            },
            {
                value: 'RUSSIA',
                label: '俄罗斯'
            },
            {
                value: 'CHILE',
                label: '智利'
            },
            {
                value: 'COLONBIA',
                label: '哥伦比亚'
            },
            {
                value: 'ECUADOR',
                label: '厄瓜多尔'
            },
            {
                value: 'ARGENTINA',
                label: '阿根廷'
            },
            {
                value: 'Philippins',
                label: '菲律宾'
            },
            // {
            //     value:'UKRAINE',
            //     label:'乌克兰'
            // },
            {
                value: 'PERU',
                label: '秘鲁'
            },
            {
                value: 'COSTARICA',
                label: '哥斯达黎加'
            },
            // {
            //     value:'VIETNAM',
            //     label:'越南'
            // },
            // {
            //     value:'UK',
            //     label:'英国'
            // },
            {
                value: 'PANAMA',
                label: '巴拿马'
            },
            {
                value: 'URUGUAY',
                label: '乌拉圭'
            },
            {
                value: 'MEXICO',
                label: '墨西哥'
            },
            {
                value: 'PARAGUAY',
                label: '巴拉圭'
            },
            {
                value: 'KOREA',
                label: '韩国'
            },
            {
                value: 'PAKIS',
                label: '巴基斯坦'
            },
            {
                value: 'VENEZUELA',
                label: '委内瑞拉'
            },
            {
                value: 'INDIA',
                label: '印度'
            }
        ]
    },
    mutations: {
        /* 设置当前绑定数据的原始索引 */
        // setCurrentIndex(state, data) {
        //   state.currentIndex = data;
        // },

    },
    actions: {
        getCompanyInfo(state) {
            // var arr = []
            // state.companyFields.forEach(item => {
            //   if()
            // });
        },
        /* 初始化表格数据 */
        isEmptyObject(context, obj) { /* 判断一个对象是否为空 */
            for (let key in obj) {
                return false;
            }
            ;
            return true;
        }
    },
    getters: {}
};
