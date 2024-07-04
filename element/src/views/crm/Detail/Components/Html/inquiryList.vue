<template>
    <div class="drawer__inquiryList">
        <div class="_f _a_c _j_b">
            <h4>{{$t('crm.Table.inquiry')}} ({{total_num}})</h4>
            <Icon v-if="authorized_button['newInquiry'] && !disabled && type !== 'contact' && originalType !== 'highseasCustomer'"
                custom="custom-dabiaoqian"
                class="cursor-pointer"
                @click="visible_new_inquiry = true"
                color="#677F99"
                size="20"></Icon>
        </div>
        <Row
            class="inquiryListBox"
            :gutter="12"
            :style="`height: ${table_height}px`"
            v-infinite-scroll="loadMore"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="noMore"
            :infinite-scroll-distance="10">
            <Col :span="colSpan" v-for="(item, index) in table_data" :key="item.id">
                <div class="inquiryCard">
                    <div class="contactCard-top">
                        <p class="">
                            <a style="margin-right: 8px;" href="javascript:void(0)" class="ct_email" @click.stop="viewInquiry(item.id)">{{item.seqNumber}}</a>
                            <Icon custom="custom-main-contact"
                                size="14"
                                style="margin-right: 8px;"
                                :color="item.isMainInquiry ? '#F5A623' : '#C4C4C4'"></Icon>
                            <Icon custom="custom-crm-mark"
                                :title="$t('crm.newDetail.title_signInquiry')"
                                @click.stop="remarkFun(item, index)"
                                size="14"
                                :class="{'cursor-pointer': originalType !== 'highseasCustomer'}"
                                :color="item.inquiryMarker === 1 ? '#F5A623' : '#C4C4C4'"></Icon>
                        </p>
                        <Icon v-if="authorized_button['editInquiry'] && !disabled && originalType !== 'highseasCustomer'"
                            custom="custom-field-edit"
                            size="14"
                            @click="edit(item)"></Icon>
                    </div>
                    <div class="contactCard-body" :class="['mail', 'mail_detail'].includes(from) ? 'contactCard-body-little': ''">
                        <div class="contactCard-item" v-if="authorizedField.productCategory">
                            <p class="contact-item-title">{{$t('crm.Table.col_productCategory')}}</p>
                            <Tooltip :disabled="item.productCategory === '-'" :content="item.productCategory" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    {{item.productCategory}}
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.demandProducts">
                            <p class="contact-item-title">{{$t('crm.Table.col_demandProducts')}}</p>
                            <Tooltip :disabled="!item.demandProducts" :content="item.demandProducts" placement="top-start" :visible-arrow="false">
                                <p class="contact-item-value">
                                    {{item.demandProducts || '-'}}
                                </p>
                            </Tooltip>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.grouping">
                            <p class="contact-item-title">{{$t('crm.Table.col_grouping')}}</p>
                            <p class="contact-item-value">
                                {{item.grouping || '-'}}
                            </p>
                        </div>
                        <div class="contactCard-item" v-if="authorizedField.followUp">
                            <p class="contact-item-title">{{$t('crm.Table.col_followUp')}}</p>
                            <p class="contact-item-value">
                                {{item.followUp}}
                            </p>
                        </div>
                        <div class="contactCard-item">
                            <p class="contact-item-title">{{ $t('crm.Table.col_createTime')}}</p>
                            <p class="contact-item-value">
                                {{item.createTime}}
                            </p>
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
        <!-- 编辑询盘 -->
        <EditInquiry :visible.sync="visible_edit_inquiry"
                     :inquiryId="inquiryId"
                     :inquiry_columns_authorized="inquiry_columns_authorized"
                     :flag_update_detail.sync="flag_update_detail"></EditInquiry>
        <!-- 新增询盘 -->
        <NewInquiry :visible.sync="visible_new_inquiry"
                :companyId="companyId"
                @refreshContact="refreshCheck">
        </NewInquiry>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import EditInquiry from '@/views/crm/Detail/Components/Modal/editInquiry';
    import NewInquiry from '@/views/crm/Detail/Components/Modal/newInquiry';
    import { crmInquiry } from '@/api/crm/index';

    export default {
        name: 'inquiryList',
        components: {
            EditInquiry,
            NewInquiry
        },
        props: [
            'id',
            'type',
            'originalType',
            'from',
            'inquiry_columns_authorized',
            'flag_update_inquiry',
            'email',
            'globalSearchInquiryId',
            'globalSearchFlag',
            'disabled',
            'colSpan'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                window_height: 'window_height',
                button_list: state => state.app.button_list,
                selectOptions: state => state.crm.selectOptions
            }), // 从 vuex 中获取属性
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ]),
            authorized_button() {
                const customer = BUTTON_IDS.CRM.customer;
                const inquiry = BUTTON_IDS.CRM.inquiry;
                return {
                    editInquiry: !HANDLE_BUTTON(inquiry.edit.editInquiry, this.button_list),
                    newInquiry: !HANDLE_BUTTON(customer.edit.newInquiry, this.button_list)
                };
            },
            table_height() {
                let temp = this.window_height ? this.window_height - 235 : document.body.clientHeight - 235;
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        if (['mail', 'mail_detail', 'whatsApp'].includes(this.from)) {
                            temp -= 100;
                        } else {
                            temp -= 80;
                        }
                        break;
                    default:
                        temp -= 60;
                        break;
                }
                return temp > 200 ? temp : 200;
            },
            authorizedField() {
                const defaultFields = this.inquiry_columns_authorized.default || [];
                let productCategory = false;
                let demandProducts = false;
                let grouping = false;
                let followUp = false;
                defaultFields.forEach(item => {
                    if (item.storageName === 'productCategory') {
                        productCategory = true;
                    }
                    if (item.storageName === 'demandProducts') {
                        demandProducts = true;
                    }
                    if (item.storageName === 'grouping') {
                        grouping = true;
                    }
                    if (item.storageName === 'followUp') {
                        followUp = true;
                    }
                });
                return {
                    productCategory: productCategory,
                    demandProducts: demandProducts,
                    grouping: grouping,
                    followUp: followUp
                };
            },
            url_get_inquiry_list() {
                switch (this.type) {
                    case 'customer':
                    case 'highseasCustomer':
                        return '/crm/inquiry/getInquiryListByCompany';
                    case 'contact':
                        return '/crm/inquiry/getInquiryByContactsId';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                noMore: false,
                table_data: [],
                page_no: 1,
                page_size: 20,
                total_num: 0,
                loading: true, // 加载图标
                /* 公海记录 */
                inquiryId: '',
                visible_new_inquiry: false,
                visible_edit_inquiry: false,
                flag_update_detail: false,
                companyId: ''
            };
        },
        methods: {
            loadMore() {
                if (!this.loading) {
                    this.page_no++;
                    this.get_inquiry_list();
                }
            },
            get_inquiry_list() {
                const hasInquiry = this.isContainsMenu('myInquiry');
                const hasHighSeas = this.isContainsMenu('highseasCustomer');
                let type = 0;
                if (this.type !== 'contact') {
                    if (hasInquiry && hasHighSeas) {
                        type = 2;
                    } else if (hasInquiry && !hasHighSeas) {
                        type = 1;
                    } else if (!hasInquiry && hasHighSeas) {
                        type = 0;
                    }
                }
                this.loading = true;
                this.$util.ajax({
                    url: this.url_get_inquiry_list,
                    method: 'post',
                    data: {
                        orgId: this.enterpriseId,
                        userId: this.userId,
                        companyId: this.id,
                        contactsId: this.id,
                        pageNo: this.page_no,
                        pageSize: this.page_size,
                        listType: type
                    }
                }).then(response => {
                    if (response.data.code === '1') {
                        this.total_num = (response.data.data && response.data.data.total) ? response.data.data.total : 0;
                        const totlePage = Math.ceil(this.total_num / 20);
                        if (this.page_no === totlePage) {
                            this.noMore = true;
                        }
                        if (response.data.data && Array.isArray(response.data.data.list)) {
                            if (!this.companyId) {
                                this.companyId = response.data.data.list[0].companyId;
                            }
                            const tableData = response.data.data.list.map(item => {
                                item.productCategory = this.$options.filters.parseArray(item.productCategory).length ? this.$options.filters.parseArray(item.productCategory).join(', ') : '-';
                                if (/\d+/.test(`${item.followUpId}`)) {
                                    if (`${item.followUpId}` === '-1') {
                                        item.followUp = this.$t('crm.UniSet.defaultFollowUpStatus_closeInquiry');
                                    } else {
                                        const temp = this.selectOptions.followUp ? this.selectOptions.followUp.find(items => `${items.attrId}` === `${item.followUpId}`) : undefined;
                                        item.followUp = temp ? temp.attrName : '-';
                                    }
                                } else {
                                    item.followUp = item.followUp || '-';
                                }
                                item.createTime = this.$options.filters.timeFormat(item.createTime, 'DateTime');
                                return item;
                            });
                            this.table_data = this.table_data.concat(tableData);
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Table.error_getInquiryTableData'));
                    }
                    this.loading = false;
                });
            },
            async viewInquiry(id) {
                // 判断是否有"我的询盘"页面权限
                if (!this.isContainsMenu('myInquiry')) {
                    // 没有"我的询盘"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyInquiry'));
                    return;
                }

                // 无 inquiryId , 退出流程
                if (!id) {
                    this.$Message.error(this.$t('crm.Modal.error_inquiryId'));
                    return;
                }

                // 查询该公司 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Inquiry',
                    id
                });
                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海客户
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpInquiryInHighseas'));
                    return;
                }

                // 新窗口跳转到询盘页面
                localStorage.setItem('leadsCloud-inquiryId', id);
                this.$stm.openNewWindow(this.$rootRouter.resolve({
                    name: 'myInquiry'
                }).href);
            },
            remarkFun(item, index) {
                if (this.originalType === 'highseasCustomer') return;
                let flag = 1;
                if (item.inquiryMarker === 1) {
                    flag = 2;
                }
                crmInquiry.updateMarker({
                    id: item.id,
                    inquiryMarker: flag
                }).then(response => {
                    if (response.code === '1') {
                        this.$set(this.table_data[index], 'inquiryMarker', flag);
                        if (flag === 1) {
                            this.$Message.success(this.$t('crm.Detail.success_addMarker'));
                        } else {
                            this.$Message.success(this.$t('crm.Detail.success_removeMarker'));
                        }
                    } else {
                        this.$Message.error(this.$t('crm.Detail.error_addMarker'));
                    }
                });
            },
            edit(item) {
                this.inquiryId = item.id;
                this.visible_edit_inquiry = true;
            },
            refreshCheck() {
                this.page_no = 1;
                this.table_data = [];
                this.noMore = false;
                this.get_inquiry_list();
            }
        },
        mounted() {
            this.refreshCheck();
        },
        watch: {
            flag_update_detail() {
                this.refreshCheck();
            },
            flag_update_inquiry() {
                this.refreshCheck();
            },
            globalSearchInquiryId: {
                /* 专用于处理从全局搜索结果页跳转至公海客户详情页时，自动打开公海询盘的操作 */
                handler(val) {
                    if (this.globalSearchFlag) {
                        this.viewInquiry(this.globalSearchInquiryId);
                    }
                },
                immediate: true
            }
        }
    };
</script>

<style lang="less">
    .drawer__inquiryList {
        h4 {
            font-size: 16px;
            line-height: 38px;
            color: #333;
        }
        .inquiryListBox {
            overflow: auto;
        }
        .inquiryCard {
            margin-bottom: 12px;
            background: #F9FBFD;
            border: 1px solid #EDF3F9;
            border-radius: 8px;
            .custom-field-edit {
                display: none;
                color: #677F99;
                cursor: pointer;
                &:hover {
                    color: #4285F2;
                }
            }
            &:hover {
                .custom-field-edit {
                    display: block;
                }
            }
            .contactCard-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 16px 16px 12px;
                p {
                    font-size: 14px;
                    color: #333;
                    line-height: 16px;
                    font-weight: 600;
                    vertical-align: middle;
                }
                .custom-nan {
                    color: #4285F2;
                }
                .custom-nv {
                    color: #FF7484;
                }
            }
            .contactCard-body {
                padding: 0 16px;
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: flex-start;
                .contactCard-item {
                    width: 50%;
                    .contact-item-title {
                        margin-bottom: 10px;
                        font-size: 12px;
                        line-height: 14px;
                        color: rgba(0, 0, 0, 0.6);
                    }
                    .contact-item-value {
                        margin-bottom: 16px;
                        font-size: 14px;
                        line-height: 16px;
                        color: #1A1A1A;
                        overflow:hidden;
                        white-space:nowrap;
                        text-overflow:ellipsis;
                    }
                }
            }
            .contactCard-body-little {
                .contactCard-item {
                    width: 100%;
                }
            }
        }
    }
</style>
