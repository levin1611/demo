<template>
    <Modal :visible="visible"
           :title="$t('timeLine.accessDetails')"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :append-to-body="true"
           :modal-append-to-body="false"
           :styles="{width:`${modalWidth}px`}"
           class="access-modal">
        <!--<div class="web-tip">{{ currContent }}</div>-->
        <!-- 访问信息 -->
        <div v-if="visitorInfo && JSON.stringify(visitorInfo) !== '{}'">
            <Row>
                <!-- visitorId -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.visitorID') }}: </span>
                    {{ visitorInfo.visitorId }}
                </Col>
                <!-- 开始访问时间 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.create_time') }}: </span>
                    {{ visitorInfo.createTime | timeFormat("DateTime") }}
                </Col>
                <!-- 访问来源 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.source') }}: </span>
                    <span v-if="visitorInfo.visitSource"
                          :title="visitorInfo.visitSource.length >= 30 ? visitorInfo.visitSource : ''">
                            {{ visitorInfo.visitSource.length >= 30 ? visitorInfo.visitSource.slice(0, 31) + '...' : visitorInfo.visitSource }}</span>
                    <span v-else>{{ visitorInfo.visitSource }}</span>
                </Col>
                <!-- 是否聊过天 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.is_chatted') }}: </span>
                    {{ visitorInfo.haveChat | filterTip }}
                </Col>
                <!-- IP 定位 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.ip_location') }}: </span>
                    {{ visitorInfo.ipLocation }}
                </Col>
                <!-- 接待客服 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.customer_service') }}: </span>
                    {{ visitorInfo.receptionServer }}
                </Col>
                <!-- IP 地址 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.ip_addr') }}: </span>
                    {{ visitorInfo.ipAddress }}
                </Col>
                <!-- 访客讯息总数 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.visitor_chat_count') }}: </span>
                    {{ visitorInfo.visitorChatCount }}
                </Col>
                <!-- 客服讯息总数 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.service_chat_count') }}: </span>
                    {{ visitorInfo.serverChatCount }}
                </Col>
                <!-- 浏览器版本 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.browser_version') }}: </span>
                    {{ visitorInfo.browserVersion }}
                </Col>
                <!-- 屏幕分辨率 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.screen_resolution') }}: </span>
                    {{ visitorInfo.screenResolution }}
                </Col>
                <!-- 初次访问网址 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.first_visit_address') }}: </span>
                    <span v-if="visitorInfo.firstVisitorAddress"
                          :title="visitorInfo.firstVisitorAddress.length >= 30 ? visitorInfo.firstVisitorAddress:''">
                            {{ visitorInfo.firstVisitorAddress.length >= 30 ? visitorInfo.firstVisitorAddress.slice(0, 31) + '...' : visitorInfo.firstVisitorAddress }}</span>
                    <span v-else>{{ visitorInfo.firstVisitorAddress }}</span>
                </Col>
                <!-- 浏览器 -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.browser') }}: </span>
                    {{ visitorInfo.browser }}
                </Col>
                <!-- 访问来源类别 [广告类型，广告系列名称、广告组名称、广告名称、广告关键词] -->
                <Col :span="12">
                    <span class="web-tip">{{ $t('visitor_history.traffic_source') }}: </span>
                    {{ visitorInfo.trafficSource ? trafficSourceList[visitorInfo.trafficSource - 1]['label'] : '' }}
                </Col>
                <template v-if="visitorInfo.trafficSource === '1' && visitorInfo.showBtn">
                    <Col :span="24"><span style="color:#3b78de;font-size:14px;margin-top: .5em;font-weight:500;cursor: pointer;" @click.stop="hiddenItem(visitorInfo, item)">{{$t('timeLine.googleAdBtn')}}</span></Col>
                </template>
                <template v-if="visitorInfo.trafficSource === '1' && !visitorInfo.showBtn">
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleAd')}}</span>
                        {{visitorInfo['ad_name']}}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleGroup')}}</span>
                        {{visitorInfo['group_name']}}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleKeyWord')}}</span>
                        {{visitorInfo['utm_keyword']}}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleMatchType')}}</span>
                        {{visitorInfo['utm_matchtype']}}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleDevice')}}</span>
                        {{visitorInfo['utm_device']}}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleCampaign')}}</span>
                        {{visitorInfo['campaign_name']}}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{$t('timeLine.googleNetwork')}}</span>
                        {{visitorInfo['utm_network']}}
                    </Col>
                </template>
                <template v-if="visitorInfo.trafficSource === '2' || visitorInfo.trafficSource === '3'">
                    <Col :span="12">
                        <span class="web-tip">{{ $t('visitor_history.ad_type') }}: </span>
                        {{ visitorInfo.adType }}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{ $t('visitor_history.ad_campaign_name') }}: </span>
                        {{ visitorInfo.adCampaignName }}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{ $t('visitor_history.ad_group_name') }}: </span>
                        {{ visitorInfo.adGroupName }}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{ $t('visitor_history.ad_name') }}: </span>
                        {{ visitorInfo.adName }}
                    </Col>
                    <Col :span="12">
                        <span class="web-tip">{{ $t('visitor_history.ad_keyword') }}: </span>
                        {{ visitorInfo.adKeyword }}
                    </Col>
                </template>
            </Row>
        </div>
        <!-- 轨迹信息 -->
        <div style="margin-top: 5px">
            <div v-if="!(Array.isArray(mergeInfoList) && mergeInfoList.length)">{{ $t('timeLine.noData') }}</div>
            <template v-else>
                <div v-for="(item,index) in mergeInfoList"
                     :key="index">
                    <div v-if="item.type === 'traceOrder'" class="info-item">
                        <div class="item-header clearfloat">
                            <span class="info-time">{{item.createTime | timeFormat("DateTime")}}</span>
                            <span class="trace-web-title">{{`-> ${item.title}`}}</span>
                        </div>
                        <div class="item-body">
                            <div>
                                {{item.idorder ? 'Revenue: ' : 'Revenue lest in cart: '}}<span>{{item.revenue}}</span>,Quantity: <span>{{item.items}}</span>
                            </div>
                            <template v-if="item.data">
                                <div style="box-sizing:border-box;padding-left: 20px" v-for="(v,i) in item.data" :key="i">
                                    <span>{{v.sku_name}}</span>:<span>{{v.product_name}}</span>,Quantity: <span>{{v.quantity}}</span>,Price: <span>{{v.price}}</span>
                                </div>
                            </template>
                            <div v-if="item.targetUrl">
                                {{$t('visitor_history.to')}}&nbsp; <a class="item-event" style="padding-left:10px" target="_blank" :href="item.targetUrl">{{item.targetUrl}}</a>
                            </div>
                        </div>
                    </div>
                    <div v-if="item.type === 'trace' && item.currentActionType !== 2 && (item.fromAddress || item.toAddress)"
                         class="info-item">
                        <div class="item-header clearfloat">
                            <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                            <template v-if="item.currentActionType === 3">
                                <span class="trace-web-title">{{ $t('visitor_history.fileDownload') }}: </span>
                                <a :href="item.currentActionName"
                                   target="_blank"
                                   style="padding-left:10px"
                                   class="item-event">{{ item.currentActionName }}</a>
                            </template>
                            <span v-else-if="item.currentActionType === 10"
                                  class="trace-web-title">-> {{ item.preActionName }} - {{ item.middleActionName }} - {{ item.title }}</span>
                            <span v-else-if="item.currentPageType === 8"
                                  class="trace-web-title">{{ $t('visitor_history.SearchkeywordsWithinSite') }}: {{ item.title }}</span>
                            <span v-else
                                  class="trace-web-title">{{ item.title }}</span>
                        </div>
                        <div v-if="item.currentActionType == 1 || item.currentActionType == undefined"
                             class="item-body">
                            <div v-if="item.fromAddress">
                                {{ $t('visitor_history.from') }}&nbsp;
                                <a :href="item.fromAddress"
                                   target="_blank"
                                   style="padding-left:10px"
                                   class="item-event">
                                    {{ item.fromAddress }}</a>
                            </div>
                            <div v-if="item.toAddress">
                                {{ $t('visitor_history.to') }}&nbsp;
                                <a :href="item.toAddress"
                                   target="_blank"
                                   style="padding-left:10px"
                                   class="item-event">{{ item.toAddress }}</a>
                            </div>
                        </div>
                        <div v-else-if="item.currentActionType === 2"
                             class="item-body"></div>
                        <div v-else
                             class="item-body">
                            <div v-if="item.fromAddress || item.toAddress">
                                {{ $t('visitor_history.on') }}&nbsp;
                                <a :href="item.fromAddress || item.toAddress"
                                   target="_blank"
                                   style="padding-left:10px"
                                   class="item-event">
                                    {{ item.fromAddress || item.toAddress }}</a>
                            </div>
                        </div>
                        <!-- <div class="item-body">
                            {{ item.fromAddress }}{{ item.toAddress }}
                        </div> -->
                    </div>
                    <div v-else-if="item.type === 'chat'"
                         class="info-item">
                        <div class="item-header clearfloat">
                            <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                            <div class="info-title">{{ item.fromNick }}</div>
                        </div>
                        <div v-if="item.msgType === 'text'"
                             class="item-body">{{ item.body }}
                        </div>
                        <div v-else-if="item.msgType === 'image'"
                             class="item-body">
                            <img :src="$stm.dealImgName(item.attach, item.body)">
                        </div>
                        <div v-else-if="item.msgType === 'file'">
                            <a :href="`${item.attach}&download=${item.body}`"
                               target="_blank">
                                <i class="u-icon icon-file"></i>{{ item.body }}
                            </a>
                        </div>
                    </div>
                    <div v-else-if="item.type === 'msg'"
                         class="info-item">
                        <div class="item-header clearfloat">
                            <div class="info-time">{{ item.createTime | timeFormat("DateTime") }}</div>
                            <div class="info-title">{{ item.title }}</div>
                        </div>
                        <div class="item-body">
                            <!-- 正常字段 -->
                            <div v-for="(item1, idx1) in item.fields" :key="idx1">
                                <!-- 点击 wa 跳转打开会话 -->
                                <template v-if="idx1 === 'a10052'">
                                    <span class="form-item">{{ item1.label }}</span>
                                    <template v-if="is_marketing_station">
                                        <span>{{ item1.value }}</span>
                                    </template>
                                    <template v-else>
                                        <span @click="handleOpenWaDialog(item1.value, item)"
                                          class="jump-link">{{ item1.value }}</span>
                                    </template>
                                </template>
                                <template v-else>
                                    <span class="form-item">{{ item1.label }}</span>
                                    <template v-if="is_marketing_station">
                                        <span>{{ item1.value }}</span>
                                    </template>
                                    <template v-else>
                                        <a v-if="idx1 === 'a10010' && item1.value" href="javascript:void(0)" @click="quickSend(item)" class="jump-link">{{ item1.value }}</a>
                                        <span v-else>{{ item1.value }}</span>
                                    </template>
                                </template>

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
                        <!-- 产品信息 -->
                        <div v-if="Array.isArray(productList[item.id]) && productList[item.id].length"
                             class="item-table">
                            <Table :data="productList[item.id]"
                                   size="medium">
                                <TableColumn v-for="col in chartColumns.filter(col => productList[item.id].some(dataItem => !['', null, undefined].includes(dataItem[col.key])))"
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
                </div>
            </template>
        </div>
        <!-- footer -->
        <div slot="footer">
            <Button size="large"
                    @click="$emit('update:visible', false)"
                    :class="class_closesiteinteractiondetails">{{ $t('close') }}</Button>
        </div>
    </Modal>
</template>

<script>
    import i18n from '@/locale';
    import util from '@/libs/util';
    import { mapState, mapGetters } from 'vuex';
    import globalWaReplyModal from '@/mixins/globalWaReplyModal';

    export default {
        name: 'accessDetail',
        mixins: [globalWaReplyModal],
        props: [
            'visible',
            'type',
            'modalWidth',
            'visitorInfo',
            'item',
            // 'currContent',
            'mergeInfoList'
        ],
        filters: {
            filterTip(tip) {
                return tip === '1' ? i18n.t('yes') : i18n.t('no');
            }
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                is_marketing_station: state => state.app.is_marketing_station
            }),
            ...mapGetters([
                'isContainsMenu'
            ]),
            class_closesiteinteractiondetails() {
                switch (this.type) {
                    case 'clue':
                        return 'clue-close-site-interaction-details';
                    case 'inquiry':
                        return 'inquiry-closesiteinteractiondetails';
                    case 'customer':
                        return 'customer-closesiteinteractiondetails';
                    case 'highseasCustomer':
                        return 'highseasCustomer-closesiteinteractiondetails';
                    case 'contact':
                        return 'contact-closesiteinteractiondetails';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                trafficSourceList: [
                    {
                        value: 1,
                        label: this.$t('visitor_history.ad_google')
                    },
                    {
                        value: 2,
                        label: this.$t('visitor_history.ad_facebook')
                    },
                    {
                        value: 3,
                        label: this.$t('visitor_history.ad_other')
                    },
                    {
                        value: 4,
                        label: this.$t('visitor_history.email_marketing')
                    },
                    {
                        value: 5,
                        label: this.$t('visitor_history.search_engine')
                    },
                    {
                        value: 6,
                        label: this.$t('visitor_history.social_network')
                    },
                    {
                        value: 7,
                        label: this.$t('visitor_history.other_referrals')
                    },
                    {
                        value: 8,
                        label: this.$t('visitor_history.direct_access')
                    }
                ],

                // 产品信息
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
                productList: {},
                // 网站部为某些客户添加的特殊定制字段
                externalDataList: {}
            };
        },
        methods: {
            hiddenItem(visitorInfo, item) {
                this.$emit('updateVistorInfo', visitorInfo, item);
            },
            // 获取购物车信息列
            getProductList(formId) {
                this.$set(this.productList, formId, []);
                this.$set(this.externalDataList, formId, []);
                util.ajax({
                    url: '/form-cust/product/getList',
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        formId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        if (Array.isArray(res.data.data.list) && res.data.data.list.length) {
                            this.productList[formId] = res.data.data.list;
                        }
                        if (Array.isArray(res.data.data.formOptionsDtoList) && res.data.data.formOptionsDtoList.length) {
                            this.externalDataList[formId] = res.data.data.formOptionsDtoList;
                        }
                    }
                });
            },
            // 跳转至WhatsApp，并进行跳转前校验
            async handleOpenWaDialog(WAAccount, formData) {
                if (this.isContainsMenu('whatsapp_chat')) {
                    // 处理要带到其他页面的表单数据
                    const insertData = await this.handleReplyFormData(formData);
                    // 插入 localStorage
                    localStorage.setItem('leadsCloud-WA-insertData', JSON.stringify({ [WAAccount]: insertData }));

                    // 打开全局回复框
                    this.openGlobalWaReplyModal(WAAccount);
                } else {
                    this.$Message.warning(this.$t('waNumberSearch.error_noWaMenuAuthority'));
                }
            },
            // 处理要带到其他页面的表单数据
            async handleReplyFormData(formData) {
                // 初始化
                let insertData = '\n-------- Reply message --------';
                insertData += `\n    Time: ${this.$options.filters.timeFormat(formData.createTime, 'DateTime')}`;
                insertData += `\n    Message page: ${formData.currentUrl}`;

                // 整理出需要翻译的文本
                const textList = [];
                Object.values(formData.fields).forEach(({ type, label, value }) => {
                    // 字段名全翻译
                    textList.push(label);
                    // // 选项型字段的选项翻译
                    // if (value) {
                    //     if (type === 'select') {
                    //         textList.push(value);
                    //     } else if (type === 'selectMultiple') {
                    //         textList.push(...(value.split(',')));
                    //     }
                    // }
                });
                // 获取多语言包
                const res_langPack = await this.$commonApi.getConfigOrBrowserLanguageForList({
                    orgId: this.enterpriseId,
                    websiteLanguageParam: '',
                    browserLangageParam: 'en',
                    textList
                });
                // 处理多语言包为对象, 方便取值
                const langObj = {};
                if (res_langPack.code === '1' && res_langPack.data && Array.isArray(res_langPack.data.languagePack)) {
                    res_langPack.data.languagePack.forEach(({ zh_cn, en }) => {
                        if (zh_cn) {
                            langObj[zh_cn] = en;
                        }
                    });
                }

                // 翻译字段名和选择/多选类字段的值为英文
                Object.values(formData.fields).forEach(({ type, label, value }) => {
                    insertData += `\n    ${langObj[label] || label}: `;
                    if (value) {
                        if (type === 'select') {
                            // 选项型字段值翻译
                            insertData += `${langObj[value] || value}`;
                        } else if (type === 'selectMultiple') {
                            // 多选型字段按 , 分割为数组逐个翻译
                            const tempArr = [];
                            value.split(',').forEach(option => {
                                tempArr.push(`${langObj[option] || option}`);
                            });
                            insertData += tempArr.join(',');
                        } else {
                            // 其他不用翻译
                            insertData += value;
                        }
                    }
                });

                // 返回结果
                return insertData;
            },
            // 打开发信弹窗
            quickSend(data) {
                if (data.a10010) {
                    const emails = [{
                        receiverName: data.a1009 || '',
                        receiveMailAddress: data.a10010,
                        followUpId: `${this.id}`,
                        followUpType: this.type === 'clue' ? 1 : 3
                    }];
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    localStorage.setItem('leadsCloud-sendMail-contents', JSON.stringify(data));
                    // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                    const doc = document.getElementById('mail_detail_modal');
                    if (!doc) {
                        this.$store.commit('setQuickSendMailVisible', true);
                    }
                }
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    let formIds = this.mergeInfoList.filter(item => item.type === 'msg').map(item => item.id);
                    formIds = [...new Set(formIds)];
                    formIds.forEach(formId => this.getProductList(formId));
                }
            }
        }
    };
</script>

<style lang="less">
    .access-modal {
        .el-dialog {
            top: 50%;
            transform: translateY(-50%);
            margin: 0 auto !important;

            .el-dialog__header {
                display: none;
            }

            .el-dialog__body {
                max-height: calc(~'90vh - 110px');
                overflow: auto;
            }
        }

        .info-item {
            border-top: 1px dashed #E6E6E6;
            padding: 10px 0;

            .item-header {
                margin-bottom: 10px;
            }
        }

        .info-time {
            margin-right: 10px;
            color: #b8b8b8;
            font-size: 12px;
            display: inline-block;
        }

        .info-title {
            display: inline-block;
        }

        .web-tip {
            font-weight: bolder;
            line-height: 20px;
        }

        .form-item {
            min-width: 100px;
            display: inline-block;
            margin-right: 15px;
        }
    }
</style>
