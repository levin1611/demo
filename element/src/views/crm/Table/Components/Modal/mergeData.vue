<template>
    <Modal :visible="visible"
           :title="title_merge"
           :show-close="false"
           :close-on-click-modal="false"
           :close-on-press-escape="false"
           :modal-append-to-body="false"
           width="600px"
           class="modal">
        <!-- loading -->
        <Spin fix v-if="loading">
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
        </Spin>

        <div>
            <div class="merge-note">
                {{ tip_merge }}
            </div>
            <Table ref="table"
                   :data="table_data"
                   class="tabmain"
                   highlight-current-row>
                <TableColumn v-for="item in current_columns"
                             :key="item.key"
                             :prop="item.key"
                             :label="item.title"
                             :render-header="item.renderHeader"
                             :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <template v-if="item.key.includes('attrValue')">
                            <Radio :value="merged_obj_temp[scope.row.key]"
                                   :label="scope.row[item.key]"
                                   @change="() => scope.$index === 0 ? check_all(item.key.substr(0, item.key.length - 10)) : check(scope, item.key.substr(0, item.key.length - 10))">
                                {{ scope.$index === 0 ? '' : scope.row[item.key] }}
                            </Radio>
                        </template>
                        <template v-else>
                            {{ scope.row[item.key] }}
                        </template>
                    </template>
                </TableColumn>
            </Table>
        </div>

        <div slot="footer">
            <Button @click="cancel">{{ $t('crm.Modal.modal_cancel') }}</Button>
            <Button v-if="!failed_request" type="primary" @click="ok" :class="class_combinedinquiry">{{
                $t('crm.Modal.modal_ok') }}
            </Button>
        </div>
    </Modal>
</template>

<script>
    import { mapState } from 'vuex';
    import { crmCommon } from '@/api/crm/index';

    export default {
        name: 'mergeData',
        props: {
            visible: {
                type: Boolean
            },
            ids: {
                type: Array
            },
            type: {
                type: String
            }
        },
        computed: {
            ...mapState([
                'enterpriseId',
                'userId'
            ]),
            class_combinedinquiry() {
                switch (this.type) {
                    case 'customer':
                        return 'customer-combinedinquiry';
                    case 'highseasCustomer':
                        return 'highseasCustomer-combinedinquiry';
                    case 'inquiry':
                        return 'inquiry-combinedinquiry';
                    default:
                        return '';
                }
            }
        },
        data() {
            return {
                loading: true,
                failed_request: true,

                /* CRM 默认字段多语言 */
                lang_contact: {
                    nickName: this.$t('crm.Modal.contact_nickName'),
                    jobTitle: this.$t('crm.Modal.contact_jobTitle'),
                    email: this.$t('crm.Modal.contact_email'),
                    phone: this.$t('crm.Modal.contact_phone'),
                    jobGrade: this.$t('crm.Modal.contact_jobGrade'),
                    socialNetworkingPlatform: this.$t('crm.Modal.contact_socialNetworkingPlatform'),
                    birthday: this.$t('crm.Modal.contact_birthday'),
                    gender: this.$t('crm.Modal.contact_gender'),
                    picture: this.$t('crm.Modal.contact_picture'),
                    remark: this.$t('crm.Modal.contact_remark')
                },
                lang_inquiry: {
                    productCategory: this.$t('crm.Modal.inq_productCategory'),
                    demandProducts: this.$t('crm.Modal.inq_demandProducts'),
                    inquiryScore: this.$t('crm.Modal.inq_inquiryScore'),
                    label: this.$t('crm.Modal.inq_label'),
                    sourceChannel: this.$t('crm.Modal.inq_sourceChannel'),
                    sourceWay: this.$t('crm.Modal.inq_sourceWay'),
                    grouping: this.$t('crm.Modal.inq_grouping'),
                    followUp: this.$t('crm.Modal.inq_followUp'),
                    estimatedInquiryAmount: this.$t('crm.Detail.inq_estimatedInquiryAmount'),
                    remark: this.$t('crm.Modal.inq_remark')
                },
                lang_company: {
                    companyName: this.$t('crm.Modal.corp_companyName'),
                    starLevel: this.$t('crm.Modal.corp_starLevel'),
                    shortName: this.$t('crm.Modal.corp_shortName'),
                    countryArea: this.$t('crm.Modal.corp_countryArea'),
                    mainProduct: this.$t('crm.Modal.corp_mainProduct'),
                    scale: this.$t('crm.Modal.corp_scale'),
                    clientType: this.$t('crm.Modal.corp_clientType'),
                    homePage: this.$t('crm.Modal.corp_homePage'),
                    phone: this.$t('crm.Modal.corp_phone'),
                    fax: this.$t('crm.Modal.corp_fax'),
                    contactAddress: this.$t('crm.Modal.corp_contactAddress'),
                    relatedCompany: this.$t('crm.Modal.corp_relatedCompany'),
                    companyPicture: this.$t('crm.Modal.corp_companyPicture'),
                    companyRemark: this.$t('crm.Modal.corp_companyRemark')
                },

                /* 自定义字段 */
                custom_field: {},

                /* 表格 */
                detailData: [],
                pre_data: {},
                next_data: {},
                current_columns: [
                    {
                        title: ' ',
                        key: 'attrName'
                    },
                    {
                        key: 'pre_attrValue',
                        renderHeader: h => {
                            return h('div', [
                                h('p', this.pre_data.companyName),
                                h('span', {
                                    on: {
                                        click: () => {
                                            this.check_all('pre');
                                        }
                                    },
                                    style: {
                                        color: '#FA8241',
                                        cursor: 'pointer'
                                    }
                                }, this.$t('crm.Table.selectAll'))
                            ]);
                        }
                    },
                    {
                        key: 'next_attrValue',
                        renderHeader: h => {
                            return h('div', [
                                h('p', this.next_data.companyName),
                                h('span', {
                                    on: {
                                        click: () => {
                                            this.check_all('next');
                                        }
                                    },
                                    style: {
                                        color: '#FA8241',
                                        cursor: 'pointer'
                                    }
                                }, this.$t('crm.Table.selectAll'))
                            ]);
                        }
                    }
                ],
                table_data: [],
                merged_obj: {},
                merged_obj_temp: {},

                /* 根据传入参数不同动态变化的数据 */
                // 请求详情 url
                url_request_detail: '',
                // 合并 url
                url_merge: '',
                // 请求自定义字段用 parentId
                parentId: 0,
                // 合并 Modal 标题
                title_merge: '',
                // 合并提示
                tip_merge: '',
                // 默认字段 + 多语言
                lang_default_columns: {}
            };
        },
        methods: {
            /* 全局 */
            // 请求详情
            get_detail() {
                return new Promise(resolve => {
                    if (this.url_request_detail) {
                        this.$util.ajaxJson({
                            url: this.url_request_detail,
                            method: 'post',
                            data: {
                                idList: this.ids,
                                orgId: this.enterpriseId
                            }
                        }).then(response => {
                            if (response.data.code === '1') {
                                this.detailData = response.data.data;
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }).catch(() => {
                            resolve(false);
                        });
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_urlRequest'));
                        resolve(false);
                    }
                });
            },
            // 请求自定义字段
            get_custom_columns() {
                return new Promise(resolve => {
                    if (this.parentId) {
                        this.$commonApi.getColumnsShow({
                            orgId: this.enterpriseId,
                            parentId: this.parentId,
                            isShow: 1
                        }).then(response => {
                            if (response.code === '1') {
                                this.custom_field = response.data.show || {};
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }).catch(() => {
                            resolve(false);
                        });
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_paramsRequest'));
                        resolve(false);
                    }
                });
            },

            /* 表格 */
            format_form_data(data) {
                try {
                    data.forEach(item => {
                        if (item.label) {
                            const arr = JSON.parse(item.label);
                            const arr1 = [];
                            arr.map(item1 => {
                                arr1.push(item1.attrName);
                            });
                            item.label = arr1.join(',');
                            console.log(item.label);
                        }
                    });
                } catch (e) {
                    console.log('format_form_data error', e);
                }
                const pre_data = data.filter(item => `${item.id}` === `${this.ids[0]}`)[0];
                const next_data = data.filter(item => `${item.id}` === `${this.ids[1]}`)[0];
                if (!pre_data || !next_data) {
                    console.error('请求到的数据与 ID 不匹配');
                    return false;
                }

                this.pre_data = {
                    id: pre_data.id,
                    orgId: pre_data.orgId
                };
                this.next_data = {
                    id: next_data.id,
                    orgId: next_data.orgId
                };

                // 添加主记录
                this.table_data = [{
                    key: 'main_record',
                    attrName: this.$t('crm.Modal.mainRecord'),
                    pre_attrValue: 'pre',
                    next_attrValue: 'next'
                }];

                // 按照预设的默认字段填充表格数据
                Object.entries(this.lang_default_columns).forEach(([key, value]) => {
                    /**
                     * @Description: 产品分类 当为多选类型需要过滤为数组的情况
                     * @author mayuanzhi
                     * @date 2020/5/21
                     */
                    if (key === 'productCategory') {
                        pre_data[key] = this.$options.filters.parseArray(pre_data[key]).join(', ');
                        next_data[key] = this.$options.filters.parseArray(next_data[key]).join(', ');
                    }
                    if (pre_data[key] || next_data[key]) {
                        this.pre_data[key] = pre_data[key];
                        this.next_data[key] = next_data[key];

                        this.table_data.push({
                            key,
                            attrName: value,
                            pre_attrValue: this.pre_data[key],
                            next_attrValue: this.next_data[key]
                        });
                    }
                });

                // 按请求到的自定义字段填充表格数据
                Object.entries(this.custom_field).forEach(([key, value]) => {
                    /**
                     * @Description: 当为多选类型需要过滤为数组的情况
                     * @author mayuanzhi
                     * @date 2020/5/21
                    */
                    if (value.type === 'selectMultiple') {
                        pre_data[key] = this.$options.filters.parseArray(pre_data[key]).join(', ');
                        next_data[key] = this.$options.filters.parseArray(next_data[key]).join(', ');
                    }
                    if (pre_data[key] || next_data[key]) {
                        this.pre_data[key] = pre_data[key];
                        this.next_data[key] = next_data[key];
                        this.table_data.push({
                            key,
                            attrName: value.cname,
                            pre_attrValue: this.pre_data[key],
                            next_attrValue: this.next_data[key]
                        });
                    }
                });

                // 询盘额外需要添加 companyId ， companyName ， 以及在 followUp 更改时同步更改 followUpId
                if (this.type === 'inquiry') {
                    ['companyId', 'companyName', 'followUpId'].forEach(key => {
                        this.pre_data[key] = pre_data[key];
                        this.next_data[key] = next_data[key];
                    });
                    // 如果 companyId 都没有, 说明出错了, 返回 false
                    if (!this.pre_data.companyId || !this.next_data.companyId) {
                        return false;
                    }
                }
                // 默认以第一个为准
                this.check_all('pre');
                return true;
            },
            check_all(type) {
                switch (type) {
                    case 'pre':
                        /**
                         * @Description: type: inquiry 合并询盘时提交的数据字段对应的值都改成选中的询盘的id
                         * @author mayuanzhi
                         * @date 2020/5/25
                        */
                        if (this.type === 'inquiry') {
                            for (const key in this.pre_data) {
                                console.log('this.pre_data', key);
                                if (key !== 'id' && key !== 'orgId') {
                                    this.merged_obj[key] = this.pre_data.id;
                                } else {
                                    this.merged_obj[key] = this.pre_data[key];
                                }
                            }
                        } else {
                            this.merged_obj = Object.assign({}, this.pre_data);
                        }
                        this.merged_obj_temp = Object.assign({}, this.pre_data);
                        this.merged_obj_temp.main_record = 'pre';
                        this.merged_obj_temp.otherId = this.ids[1];
                        this.merged_obj.main_record = 'pre';
                        this.merged_obj.otherId = this.ids[1];
                        break;
                    case 'next':
                        /**
                         * @Description: type: inquiry 合并询盘时提交的数据字段对应的值都改成选中的询盘的id
                         * @author mayuanzhi
                         * @date 2020/5/25
                         */
                        if (this.type === 'inquiry') {
                            for (const key in this.next_data) {
                                if (key !== 'id' && key !== 'orgId') {
                                    this.merged_obj[key] = this.next_data.id;
                                } else {
                                    this.merged_obj[key] = this.next_data[key];
                                }
                            }
                        } else {
                            this.merged_obj = Object.assign({}, this.next_data);
                        }
                        this.merged_obj_temp = Object.assign({}, this.next_data);
                        this.merged_obj_temp.main_record = 'next';
                        this.merged_obj_temp.otherId = this.ids[1];
                        this.merged_obj.main_record = 'next';
                        this.merged_obj.otherId = this.ids[0];
                }
            },
            check(scope, type) {
                switch (type) {
                    case 'pre':
                        if (this.type === 'inquiry') {
                            this.merged_obj[scope.row.key] = this.pre_data.id;
                            if (scope.row.key === 'followUp') {
                                this.merged_obj.followUpId = this.pre_data.id;
                            }
                        } else {
                            if (scope.row.key === 'followUp') {
                                this.merged_obj.followUpId = this.pre_data.followUpId;
                            }
                            this.merged_obj[scope.row.key] = this.pre_data[scope.row.key];
                        }
                        if (scope.row.key === 'followUp') {
                            this.merged_obj_temp.followUpId = this.pre_data.followUpId;
                        }
                        this.merged_obj_temp[scope.row.key] = this.pre_data[scope.row.key];
                        break;
                    case 'next':
                        if (this.type === 'inquiry') {
                            this.merged_obj[scope.row.key] = this.next_data.id;
                            if (scope.row.key === 'followUp') {
                                this.merged_obj.followUpId = this.next_data.id;
                            }
                        } else {
                            if (scope.row.key === 'followUp') {
                                this.merged_obj.followUpId = this.next_data.followUpId;
                            }
                            this.merged_obj[scope.row.key] = this.next_data[scope.row.key];
                        }
                        if (scope.row.key === 'followUp') {
                            this.merged_obj_temp.followUpId = this.next_data.followUpId;
                        }
                        this.merged_obj_temp[scope.row.key] = this.next_data[scope.row.key];
                }
            },

            /* 模态框 */
            ok() {
                if (['customer', 'highseasCustomer', 'inquiry'].includes(this.type)) {
                    this.loading = true;

                    const send_data = Object.assign({}, this.merged_obj);
                    delete send_data.main_record;

                    const { id: newInquiryId, otherId: originalInquiryId } = send_data;
                    const data_mergeInquiryMails = { newInquiryId, originalInquiryId };

                    this.$util.ajax({
                        url: this.url_merge,
                        method: 'post',
                        data: send_data
                    }).then(response => {
                        if (response.data.code === '1') {
                            // this.save_log();
                            this.$Message.success(this.$t('crm.Modal.success_merge'));
                            this.$emit('update:visible', false);
                            this.$emit('refreshData');

                            if (this.type === 'inquiry') {
                                this.merge_inquiry_mails(data_mergeInquiryMails);
                            }
                        } else {
                            this.$Message.error(this.$t('crm.Modal.error_merge'));
                        }
                        this.loading = false;
                    }, error => {
                        this.loading = false;
                    }).catch(error => {
                        this.loading = false;
                    });
                } else {
                    this.$Message.error(this.$t('crm.newDetail.error_urlRequest'));
                }
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            merge_inquiry_mails({ newInquiryId, originalInquiryId }) {
                crmCommon.mergerInquiry({
                    orgId: this.enterpriseId,
                    userId: this.userId,
                    newInquiryId: `${newInquiryId}`,
                    originalInquiryId: `${originalInquiryId}`
                });
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    // 各种初始化
                    this.loading = true;
                    this.failed_request = true;
                    this.pre_data = {};
                    this.next_data = {};
                    this.table_data = [];
                    this.merged_obj = {};
                    this.merged_obj_temp = {};

                    // flag 标识传入 type 是否正确
                    let flag = true;
                    switch (this.type) {
                        case 'customer':
                        case 'highseasCustomer':
                            this.url_request_detail = '/crm/companyMerge/getCompanyListForMerge';
                            this.url_merge = '/crm/companyMerge/merge';
                            this.parentId = 1;
                            this.title_merge = this.$t('crm.Modal.title_mergeCustomer');
                            this.tip_merge = this.$t('crm.Modal.tip_mergeCustomer');
                            this.lang_default_columns = this.lang_company;
                            break;
                        case 'inquiry':
                            this.url_request_detail = '/crm/inquiryMerge/getInquiryListForMerge';
                            this.url_merge = '/crm/inquiryMerge/merge';
                            this.parentId = 3;
                            this.title_merge = this.$t('crm.Modal.title_mergeInquiry');
                            this.tip_merge = this.$t('crm.Modal.tip_mergeInquiry');
                            this.lang_default_columns = this.lang_inquiry;
                            break;
                        default:
                            this.url_request_detail = '';
                            this.url_merge = '';
                            this.parentId = 0;
                            this.title_merge = '';
                            this.tip_merge = '';
                            this.lang_default_columns = {};
                            flag = false;
                    }

                    if (flag) {
                        this.$util.axios.all([this.get_detail(), this.get_custom_columns()]).then(this.$util.axios.spread((...responses) => {
                            this.loading = false;
                            if (responses.every(item => item)) {
                                if (this.format_form_data(this.detailData)) {
                                    this.failed_request = false;
                                } else {
                                    this.failed_request = true;
                                    this.pre_data = {};
                                    this.next_data = {};
                                    this.table_data = [];
                                    this.merged_obj = {};
                                    this.merged_obj_temp = {};
                                }
                            }
                            if (this.failed_request) {
                                switch (this.type) {
                                    case 'customer':
                                    case 'highseasCustomer':
                                        this.$Message.error(this.$t('crm.Detail.error_getCompanyInfo'));
                                        break;
                                    case 'inquiry':
                                        this.$Message.error(this.$t('crm.Detail.error_getInquiryInfo'));
                                        break;
                                }
                            }
                            this.loading = false;
                        }), error => {
                            this.loading = false;
                        }).catch(error => {
                            this.loading = false;
                        });
                    } else {
                        this.$Message.error(this.$t('crm.newDetail.error_paramsRequest'));
                    }
                }
            }
        }
    };
</script>

<style scoped lang="less">
    .merge-note {
        text-align: center;
        padding: 20px;
    }
</style>
